import re
s = open('template.html').read()
def inl(path):
    v = open(path).read()
    v = re.sub(r'<title>.*?</title>', '', v)
    v = re.sub(r' width="\d+" height="\d+"', '', v)
    return v.replace('xmlns="http://www.w3.org/2000/svg" ', '').replace('role="img"', 'aria-hidden="true" focusable="false"')
I = '../naqa-identite/v2/'
star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 0l2.93 2.93H17.07V7.07L20 10l-2.93 2.93v4.14h-4.14L10 20l-2.93-2.93H2.93v-4.14L0 10l2.93-2.93V2.93h4.14Z"/></svg>'
s = (s.replace('{{LOGO}}', inl(I+'naqa-horizontal-couleur.svg')).replace('{{LOGO_V}}', inl(I+'naqa-vertical-couleur.svg'))
      .replace('{{SYM_INV}}', inl(I+'naqa-symbole-inverse.svg')).replace('{{STAR}}', star).replace('{{TICK}}', star))
open('naqa.html', 'w').write(s)
print(len(s))
