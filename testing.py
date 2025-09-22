value = "ð\x9f\x98\x82ð\x9f\x98" ### gathered from the question
print(value.encode('cp1252','backslashreplace').decode('utf-8','backslashreplace'))