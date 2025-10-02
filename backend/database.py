# backend/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# === Get DB URL from environment or fallback to hardcoded or SQLite ===
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:ganesh%40captainamerica@localhost/fastapi_db")
# For SQLite fallback, you can set DATABASE_URL=sqlite:///./fastapi_app.db in .env or environment variables

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_database_url():
    """Return the current database URL being used."""
    return DATABASE_URL


def test_database_connection():
    """Test if database connection is working."""
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
