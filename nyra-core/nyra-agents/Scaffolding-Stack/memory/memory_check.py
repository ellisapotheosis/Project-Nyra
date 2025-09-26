from memory_api import add_note, query
print("Memory check: writing + querying...")
nid = add_note("This is a memory check entry.", {"type":"check"})
print("Added:", nid)
print("Query:", query("memory check"))
