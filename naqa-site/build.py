import re
s = open('template.html').read()
lk = open('../naqa-identite/concepts/b-lockup.svg').read()
lk = re.sub(r'<title>.*?</title>', '', lk)
lk = re.sub(r'viewBox="[^"]*" width="\d+" height="\d+"', 'viewBox="52 18 674 220" aria-hidden="true" focusable="false"', lk)
lk = lk.replace('xmlns="http://www.w3.org/2000/svg" ', '').replace('fill="#000"', 'fill="currentColor"').replace("fill='#000'", "fill='currentColor'")
star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 0l2.93 2.93H17.07V7.07L20 10l-2.93 2.93v4.14h-4.14L10 20l-2.93-2.93H2.93v-4.14L0 10l2.93-2.93V2.93h4.14Z"/></svg>'
s = s.replace('{{LOGO}}', lk).replace('{{STAR}}', star).replace('{{TICK}}', star)
open('naqa.html', 'w').write(s)
print(len(s))
