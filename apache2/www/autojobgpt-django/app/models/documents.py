from django.core import files
from django.db import models

import os
import io
import docx


class DocumentMixin():
  def generate_png(self, replace=False):    
    # generate the pdf using libreoffice
    outdir = "/".join(self.docx.path.split("/")[:-1])
    os.system(f"libreoffice --headless --convert-to pdf {self.docx.path} " +
      f"--outdir {outdir}")
    pdf_path = self.docx.path.replace(".docx", ".pdf")

    # convert the pdf to png using pdftoppm
    os.system(f"pdftoppm -f 1 -l 1 -png {pdf_path} " + 
      f"{self.docx.path.replace('.docx', '')}")
    png_path = self.docx.path.replace(".docx", "-1.png")

    # remove the pdf file
    os.system(f"rm {pdf_path}")

    # read in the png as a file stream
    png_file_stream = io.BytesIO()
    with open(png_path, "rb") as f:
      png_file_stream.write(f.read())
    
    # remove the extra png file
    os.system(f"rm {png_path}")

    if replace:
      # move the old file to a temporary location
      os.system(f"mv {self.png.path} {self.png.path}.tmp")

    # save the png file stream to the model with the same name as the docx file
    self.png.save(
      png_path.split("/")[-1].replace("-1.png", ".png"),
      files.File(png_file_stream)
    )

    if replace:
      # remove the old file
      os.remove(f"{self.png.path}.tmp")
  
  def open_document(self):
    # open the template with docx
    return docx.Document(self.docx.path)
  
  def extract_text(self, substitutions=None):
    # open the template with docx
    document = self.open_document()
    
    # extract all text from the template
    paragraphs = []
    for paragraph in document.paragraphs:
      paragraphs.append(paragraph.text)
    text = "\n".join(paragraphs)

    if substitutions is not None:  
      for key, value in substitutions.items():
        text = text.replace("{{" + key + "}}", value)
    
    return text

class DocumentType(models.TextChoices):
    RESUME = "resume", "resume"
    COVER_LETTER = "coverLetter", "cover letter"