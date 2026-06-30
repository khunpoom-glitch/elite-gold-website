revoke execute on function public.cleanup_expired_course_purchase_requests() from anon;
revoke execute on function public.cleanup_expired_course_purchase_requests() from public;
grant execute on function public.cleanup_expired_course_purchase_requests() to authenticated;

comment on function public.cleanup_expired_course_purchase_requests() is
  'Archives expired rejected Master Class purchase requests. Callable only by authenticated app sessions; pending reviews and approved purchase evidence are retained.';
