from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
# router.register(r'users', views.UserViewSet)

urlpatterns = [
  path("api/", include(router.urls)),
  path("", views.IndexView.as_view(), name="index"),
  path("<int:job_posting_id>/scrape", views.jobposting_scrape, name="jobposting_scrape"),
  path("<int:job_posting_id>/text", views.jobposting_text, name="jobposting_text"),
  path("<int:job_posting_id>/error", views.jobposting_error, name="jobposting_error"),
  path("<int:job_posting_id>/extract", views.jobposting_extract, name="jobposting_extract"),
  path("<int:job_posting_id>/resolve", views.jobposting_resolve, name="jobposting_resolve"),
]