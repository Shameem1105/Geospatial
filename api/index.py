import os
import sys

# Add backend directory to sys.path so app imports work seamlessly
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from app.main import app  # type: ignore # noqa: E402
except ImportError:
    from backend.app.main import app  # type: ignore # noqa: E402

__all__ = ["app"]
