# lineinfile

Ansible inspired function to ensure a specified file is added, changed or removed from a file.

NOTE: This implementation deviates from Ansible in that 'present' does not replace the line if found. For that functionality, use 'replace'.

Example Usage:

```javascript
import lineInFile from `lineinfile`

await lineInFile({
  path: `/my/file`,              // the path to the file to ensure state for
  regex: /env ?= ?'production'/, // a regex for searching for line, if unset will use literal 'line' matching
  line: `env = 'development'`,   // What should be printed instead of regex (or a new line)
  state: `present`               // [absent/present/replace] whether to remove the line, ensure it is set, or replace any occurances found
})
```



