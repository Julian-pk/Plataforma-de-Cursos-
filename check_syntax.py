with open('js/data.js', 'r', encoding='utf-8') as f:
    code = f.read()

stack = []
in_str = None
in_line_comment = False
in_block_comment = False
escaped = False

for line_no, line in enumerate(code.split('\n'), 1):
    in_line_comment = False
    for col_no, ch in enumerate(line, 1):
        if in_line_comment:
            continue
        if in_block_comment:
            if ch == '/' and col_no > 1 and line[col_no-2] == '*':
                in_block_comment = False
            continue
        if escaped:
            escaped = False
            continue
        if ch == '\\' and in_str:
            escaped = True
            continue
        if in_str:
            if ch == in_str:
                in_str = None
            continue
        
        # Check comment start
        if ch == '/' and col_no < len(line):
            next_ch = line[col_no]
            if next_ch == '/':
                in_line_comment = True
                continue
            elif next_ch == '*':
                in_block_comment = True
                continue

        if ch in ('"', "'", '`'):
            in_str = ch
            continue

        if ch in '({[':
            stack.append((ch, line_no, col_no))
        elif ch in ')}]':
            if not stack:
                print(f"Unmatched {ch} at line {line_no}, col {col_no}")
            else:
                last, l_no, c_no = stack.pop()
                expected = {'(': ')', '{': '}', '[': ']'}[last]
                if ch != expected:
                    print(f"Mismatched {last} (line {l_no}:{c_no}) closed with {ch} (line {line_no}:{col_no})")

if stack:
    print(f"Unclosed: {len(stack)} items:")
    for item in stack[:10]:
        print(item)
else:
    print("All brackets, braces, and parens are perfectly balanced!")
