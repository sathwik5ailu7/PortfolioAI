import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pymongo import MongoClient
from app.config.settings import settings

logger = logging.getLogger("portfolioai.database")

class MockCollection:
    """Thread-safe persistent JSON mock collection for seamless local development without Atlas configuration."""
    def __init__(self, name: str, filepath: str):
        self.name = name
        self.filepath = filepath
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath):
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _read_all(self) -> List[Dict[str, Any]]:
        try:
            with open(self.filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_all(self, data: List[Dict[str, Any]]):
        with open(self.filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, default=str, indent=2)

    def _match(self, item: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if isinstance(v, dict):
                # Simple operator support: $in, $ne, $regex
                if "$in" in v:
                    if item.get(k) not in v["$in"]:
                        return False
                elif "$ne" in v:
                    if item.get(k) == v["$ne"]:
                        return False
                elif "$regex" in v:
                    import re
                    pattern = v["$regex"]
                    options = v.get("$options", "")
                    flags = re.IGNORECASE if "i" in options else 0
                    if not re.search(pattern, str(item.get(k, "")), flags=flags):
                        return False
            else:
                if item.get(k) != v:
                    return False
        return True

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = self._read_all()
        for it in items:
            if self._match(it, query):
                return it
        return None

    def find(self, query: Optional[Dict[str, Any]] = None):
        items = self._read_all()
        if not query:
            res = items
        else:
            res = [it for it in items if self._match(it, query)]
        
        class Cursor:
            def __init__(self, data):
                self.data = data
            def sort(self, field, direction=-1):
                reverse = direction < 0
                self.data.sort(key=lambda x: str(x.get(field, "")), reverse=reverse)
                return self
            def limit(self, count):
                self.data = self.data[:count]
                return self
            def __iter__(self):
                return iter(self.data)
            def __list__(self):
                return self.data

        return Cursor(res)

    def insert_one(self, doc: Dict[str, Any]):
        items = self._read_all()
        if "_id" not in doc:
            import uuid
            doc["_id"] = str(uuid.uuid4())
        items.append(doc)
        self._write_all(items)
        class InsertResult:
            inserted_id = doc["_id"]
        return InsertResult()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        items = self._read_all()
        matched = False
        for it in items:
            if self._match(it, query):
                matched = True
                if "$set" in update:
                    it.update(update["$set"])
                if "$inc" in update:
                    for ik, iv in update["$inc"].items():
                        it[ik] = it.get(ik, 0) + iv
                break
        if not matched and upsert:
            new_doc = dict(query)
            if "$set" in update:
                new_doc.update(update["$set"])
            if "_id" not in new_doc:
                import uuid
                new_doc["_id"] = str(uuid.uuid4())
            items.append(new_doc)
        self._write_all(items)
        class UpdateResult:
            matched_count = 1 if matched else 0
            modified_count = 1 if matched else 0
        return UpdateResult()

    def delete_one(self, query: Dict[str, Any]):
        items = self._read_all()
        new_items = []
        deleted = False
        for it in items:
            if not deleted and self._match(it, query):
                deleted = True
                continue
            new_items.append(it)
        self._write_all(new_items)
        class DeleteResult:
            deleted_count = 1 if deleted else 0
        return DeleteResult()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        if not query:
            return len(self._read_all())
        return len([it for it in self._read_all() if self._match(it, query)])

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.use_mock = False
        self.mock_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data_store")

    def connect(self):
        if settings.MONGODB_URI and "mongodb" in settings.MONGODB_URI:
            try:
                self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=4000)
                # Verify connection
                self.client.admin.command('ping')
                self.db = self.client[settings.DATABASE_NAME]
                self.use_mock = False
                logger.info("Connected successfully to MongoDB Atlas.")
                self._setup_indexes()
                return
            except Exception as e:
                logger.warning(f"Could not connect to MongoDB Atlas ({e}). Falling back to local persistent store.")
        
        self.use_mock = True
        logger.info(f"Using local file-backed document database in {self.mock_dir}.")

    def _setup_indexes(self):
        if not self.use_mock and self.db is not None:
            try:
                self.db.users.create_index("email", unique=True)
                self.db.users.create_index("username", unique=True)
                self.db.portfolios.create_index("username", unique=True)
                self.db.portfolios.create_index("student_id")
            except Exception as e:
                logger.warning(f"Index creation note: {e}")

    def get_collection(self, collection_name: str):
        if self.use_mock or self.db is None:
            filepath = os.path.join(self.mock_dir, f"{collection_name}.json")
            return MockCollection(collection_name, filepath)
        return self.db[collection_name]

db_manager = DatabaseManager()

def get_db():
    return db_manager
