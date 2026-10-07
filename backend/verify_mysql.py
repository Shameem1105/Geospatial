from app.core.database import ensure_database_exists, engine, Base
import app.models

def verify():
    print("Testing connection to XAMPP MySQL...")
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    print("SUCCESS: Connected to MySQL and all TerraFlow tables verified/created!")

if __name__ == "__main__":
    verify()
