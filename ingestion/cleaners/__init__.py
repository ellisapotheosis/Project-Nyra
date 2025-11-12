def normalize_whitespace(text: str) -> str:
    import re
    return re.sub(r'\s+', ' ', text).strip()
