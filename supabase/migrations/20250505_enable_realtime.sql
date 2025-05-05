
-- هذا الملف يحتوي على دالة قاعدة بيانات لتمكين التحديثات الفورية للجداول

-- إنشاء دالة لتمكين التحديثات الفورية لجدول معين
CREATE OR REPLACE FUNCTION public.enable_realtime_for_table(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إضافة الجدول إلى منشور التحديثات الفورية
  PERFORM pg_catalog.pg_publication_add_table(
    'supabase_realtime',
    table_name::regclass
  );
  
  -- تعيين هوية النسخ للجدول إلى FULL لضمان إرسال البيانات الكاملة
  EXECUTE format('ALTER TABLE %I REPLICA IDENTITY FULL', table_name);
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error enabling realtime for %: %', table_name, SQLERRM;
  RETURN false;
END;
$$;

-- منح الصلاحيات للدالة
GRANT EXECUTE ON FUNCTION public.enable_realtime_for_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enable_realtime_for_table(text) TO service_role;

-- ملحوظة: يجب تنفيذ هذه الدالة يدويًا لكل جدول تريد تفعيل التحديثات الفورية له
-- مثال: SELECT enable_realtime_for_table('customers');
