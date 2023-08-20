from requests import get
from bs4 import BeautifulSoup
import re

NON_BREAKING_ELEMENTS = ['a', 'abbr', 'acronym', 'audio', 'b', 'bdi', 'bdo', 'big', 'button', 
    'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 
    'img', 'input', 'ins', 'kbd', 'label', 'map', 'mark', 'meter', 'noscript', 'object', 'output', 
    'picture', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'slot', 'small', 'span', 
    'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'tt', 'var', 'video', 'wbr']

def html_to_text(markup, preserve_new_lines=True, strip_tags=['style', 'script', 'code']):
  soup = BeautifulSoup(markup, "lxml")
  # remove unwanted tags
  for element in soup(strip_tags):
    element.extract()
  # add newlines after each line-breaking element
  if preserve_new_lines:
    for element in soup.find_all():
      if element.name not in NON_BREAKING_ELEMENTS:
        element.append('\n')
  # remove extra newlines
  return re.sub(r'[\n\s]*\n[\n\s]*', '\n', soup.get_text(" "))

def scrape_text(url):
  response = get(url)
  if response.status_code == 200:
    return html_to_text(response.text)
  else:
    raise Exception(f"{response.status_code} error: failed to scrape {url}")