import React, { useState, useMemo, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import DataTable, { Column } from '@/components/ui/DataTable';
import { useReturns } from '@/hooks/useReturns';
import { useCustomers } from '@/hooks/useCustomers';
import { Return, ReturnStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import SmartSearch from '@/components/search/SmartSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from '@/components/ui/DatePicker';

export default function ReturnsList() {
  const { getAll, deleteReturn } = useReturns();
  const { data: returns = [], isLoading } = getAll;
  const { customers } = useCustomers();
  const navigate = useNavigate();

  // إضافة حقل actions إلى الصفوف
  const rows = returns.map(r => ({
    ...r,
    customerName: customers.find(c => c.id === r.customerId)?.name || '',
    actions: ''
  }));

  // حالات البحث والفلترة
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('returns_searchTerm') || '');
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('returns_statusFilter') || 'all');
  const [dateFrom, setDateFrom] = useState(() => localStorage.getItem('returns_dateFrom') || '');
  const [dateTo, setDateTo] = useState(() => localStorage.getItem('returns_dateTo') || '');
  const [governorateFilter, setGovernorateFilter] = useState(() => localStorage.getItem('returns_governorateFilter') || 'all');
  const [cityFilter, setCityFilter] = useState(() => localStorage.getItem('returns_cityFilter') || 'all');
  useEffect(() => { localStorage.setItem('returns_searchTerm', searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem('returns_statusFilter', statusFilter); }, [statusFilter]);
  useEffect(() => { localStorage.setItem('returns_dateFrom', dateFrom); }, [dateFrom]);
  useEffect(() => { localStorage.setItem('returns_dateTo', dateTo); }, [dateTo]);
  useEffect(() => { localStorage.setItem('returns_governorateFilter', governorateFilter); }, [governorateFilter]);
  useEffect(() => { localStorage.setItem('returns_cityFilter', cityFilter); }, [cityFilter]);
  const uniqueGovernorates = useMemo(() => Array.from(new Set(customers.map(c => c.governorate).filter(Boolean))), [customers]);
  const uniqueCities = useMemo(() => governorateFilter !== 'all'
    ? Array.from(new Set(customers.filter(c => c.governorate === governorateFilter).map(c => c.city).filter(Boolean)))
    : Array.from(new Set(customers.map(c => c.city).filter(Boolean))),
  [customers, governorateFilter]);
  const customersMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);
  const rowsFiltered = useMemo(() => rows.filter(r => {
    const cust = customersMap.get(r.customerId);
    const d = new Date(r.date);
    const okSearch = !searchTerm ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const okStatus = statusFilter === 'all' || r.status === statusFilter;
    const okFrom = !dateFrom || d >= new Date(dateFrom);
    const okTo = !dateTo || d <= new Date(dateTo);
    const okGov = governorateFilter === 'all' || cust?.governorate === governorateFilter;
    const okCity = cityFilter === 'all' || cust?.city === cityFilter;
    return okSearch && okStatus && okFrom && okTo && okGov && okCity;
  }), [rows, searchTerm, statusFilter, dateFrom, dateTo, governorateFilter, cityFilter, customersMap]);

  // دالة إعادة التعيين لجميع الفلاتر
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setGovernorateFilter('all');
    setCityFilter('all');
  };

  const columns: Column<any>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'فاتورة', accessor: 'invoiceId' },
    { header: 'عميل', accessor: 'customerId' },
    { header: 'اسم العميل', accessor: 'customerName' },
    { header: 'تاريخ', accessor: 'date', Cell: value => <span>{new Date(value).toISOString().slice(0,10)}</span> },
    { header: 'المبلغ الكلي', accessor: 'totalAmount' },
    { header: 'الحالة', accessor: 'status' },
    { header: 'إجراءات', accessor: 'actions', Cell: (_value, row: Return) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => navigate(`/returns/${row.id}`)}>عرض</Button>
        <Button size="sm" disabled={row.status !== ReturnStatus.PENDING} onClick={() => navigate(`/returns/${row.id}/edit`)}>تعديل</Button>
        <Button size="sm" variant="destructive" disabled={row.status === ReturnStatus.PENDING} onClick={() => {
          deleteReturn.mutate(
            { id: row.id, invoiceId: row.invoiceId, customerId: row.customerId, status: row.status },
            { onSuccess: () => toast({ title: 'تم الحذف بنجاح' }) }
          );
        }}>حذف</Button>
      </div>
    ) }
  ];

  return (
    <PageContainer title="قائمة المرتجعات">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Button onClick={() => navigate('/returns/create')}>إضافة مرتجع</Button>
        <SmartSearch
          placeholder="بحث..."
          initialSearchTerm={searchTerm}
          onChange={setSearchTerm}
          className="w-full sm:w-40 rounded-lg"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-lg">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="approved">موافق عليه</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker
          value={dateFrom ? new Date(dateFrom) : null}
          onChange={d => setDateFrom(d ? d.toISOString().slice(0,10) : '')}
          placeholder="من تاريخ"
          className="w-full sm:w-40 rounded-lg"
        />
        <DatePicker
          value={dateTo ? new Date(dateTo) : null}
          onChange={d => setDateTo(d ? d.toISOString().slice(0,10) : '')}
          placeholder="إلى تاريخ"
          className="w-full sm:w-40 rounded-lg"
        />
        <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-lg">
            <SelectValue placeholder="المحافظة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {uniqueGovernorates.map(gov => <SelectItem key={gov} value={gov}>{gov}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-lg">
            <SelectValue placeholder="المدينة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {uniqueCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={resetFilters}>إعادة تعيين</Button>
      </div>
      <DataTable data={rowsFiltered} columns={columns} loading={isLoading} />
    </PageContainer>
  );
}
