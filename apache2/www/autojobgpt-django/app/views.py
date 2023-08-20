from django.views.generic.list import ListView
from django.shortcuts import redirect, render, get_object_or_404

from .models import JobPosting

class IndexView(ListView):
  model = JobPosting

def jobposting_scrape(request, job_posting_id):
  get_object_or_404(JobPosting, pk=job_posting_id).scrape()
  return redirect("index")

def jobposting_text(request, job_posting_id):
  return render(request, "jobposting_text.html", {
    "job_posting": get_object_or_404(JobPosting, pk=job_posting_id)
  })

def jobposting_error(request, job_posting_id):
  return render(request, "jobposting_error.html", {
    "job_posting": get_object_or_404(JobPosting, pk=job_posting_id)
  })

def jobposting_resolve(request, job_posting_id):
  get_object_or_404(JobPosting, pk=job_posting_id).resolve()
  return redirect("index")

def jobposting_extract(request, job_posting_id):
  get_object_or_404(JobPosting, pk=job_posting_id).extract()
  return redirect("index")