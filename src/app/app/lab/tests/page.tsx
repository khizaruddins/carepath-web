'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi, CreateLabTestPayload } from '@/lib/api/lab';
import { LabTest, LabTestCategory } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FlaskConical,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Home,
  Clock,
  Search,
  Filter,
  AlertTriangle,
} from 'lucide-react';

const TEST_CATEGORIES: LabTestCategory[] = [
  'HEMATOLOGY',
  'BIOCHEMISTRY',
  'PATHOLOGY',
  'MICROBIOLOGY',
  'IMMUNOLOGY',
  'ENDOCRINOLOGY',
  'URINALYSIS',
  'OTHER',
];

export default function LabTestsPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);

  const [testForm, setTestForm] = useState<CreateLabTestPayload>({
    testCode: '',
    name: '',
    category: 'HEMATOLOGY',
    description: '',
    sampleTypes: ['Whole Blood EDTA'],
    turnaroundTime: '12 hours',
    price: 35.0,
    preparationNotes: '',
    isHomeCollection: false,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch current lab profile
  const { data: labData, isLoading: labLoading } = useQuery({
    queryKey: ['my-lab-profile'],
    queryFn: () => labApi.getMyLab(),
  });

  const lab = labData?.lab;
  const isVerified = lab?.verificationStatus === 'VERIFIED';

  // 2. Fetch tests in catalog
  const {
    data: tests,
    isLoading: testsLoading,
    error: testsError,
  } = useQuery({
    queryKey: ['lab-tests', lab?.id],
    queryFn: () => (lab?.id ? labApi.listLabTests(lab.id) : Promise.resolve([])),
    enabled: !!lab?.id,
  });

  // 3. Create test mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLabTestPayload) => {
      if (!lab?.id) throw new Error('No lab ID');
      return labApi.createCatalogTest(lab.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests', lab?.id] });
      setIsAddOpen(false);
      resetForm();
      setSuccessMessage('Diagnostic test added to catalog successfully.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to create test');
    },
  });

  // 4. Update test mutation
  const updateMutation = useMutation({
    mutationFn: (data: { testId: string; payload: Partial<CreateLabTestPayload> & { isActive?: boolean } }) => {
      if (!lab?.id) throw new Error('No lab ID');
      return labApi.updateCatalogTest(lab.id, data.testId, data.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests', lab?.id] });
      setEditingTest(null);
      resetForm();
      setSuccessMessage('Diagnostic test updated successfully.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to update test');
    },
  });

  const resetForm = () => {
    setTestForm({
      testCode: '',
      name: '',
      category: 'HEMATOLOGY',
      description: '',
      sampleTypes: ['Whole Blood EDTA'],
      turnaroundTime: '12 hours',
      price: 35.0,
      preparationNotes: '',
      isHomeCollection: false,
    });
  };

  const filteredTests = (tests || []).filter((test) => {
    const matchesCategory =
      selectedCategory === 'ALL' || test.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (labLoading) {
    return <LoadingSpinner message="Loading diagnostic catalog..." />;
  }

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">&times;</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold">&times;</button>
        </div>
      )}

      {/* Unverified Lab Alert Banner */}
      {!isVerified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-amber-900">
                Catalog Inactive During Verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Your laboratory is currently {lab?.verificationStatus}. Test items cannot be ordered by patients or clinicians until your facility is verified by platform administrators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-teal-700" />
            <span>Diagnostic Test Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage offered laboratory tests, specimen requirements, preparation notes, and pricing
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
          disabled={!isVerified}
          onClick={() => {
            resetForm();
            setErrorMessage(null);
            setIsAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Diagnostic Test</span>
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-slate-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
          >
            <option value="ALL">All Categories</option>
            {TEST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests Table */}
      <Card>
        <CardContent className="p-0">
          {testsLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading catalog items...</div>
          ) : testsError ? (
            <div className="p-6 text-xs text-rose-600">Failed to load test catalog.</div>
          ) : filteredTests.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<FlaskConical className="h-6 w-6 text-slate-400" />}
                title="No diagnostic tests found"
                description={
                  searchQuery || selectedCategory !== 'ALL'
                    ? 'No tests match your active filter criteria.'
                    : 'No diagnostic tests have been configured in this laboratory catalog yet.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Test Code</th>
                    <th className="py-2.5 px-4">Test Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Specimen Type</th>
                    <th className="py-2.5 px-4">Turnaround</th>
                    <th className="py-2.5 px-4">Price</th>
                    <th className="py-2.5 px-4">Home Visit</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {test.testCode}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">
                        <div>{test.name}</div>
                        {test.preparationNotes && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            Prep: {test.preparationNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {test.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {test.sampleTypes?.join(', ') || 'Blood'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {test.turnaroundTime || '24 hrs'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        ${Number(test.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {test.isHomeCollection ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                            <Home className="h-3 w-3" /> Available
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Lab center only</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={test.isActive ? 'success' : 'neutral'}>
                          {test.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 gap-1 text-slate-600 hover:text-slate-900"
                            onClick={() => {
                              setEditingTest(test);
                              setTestForm({
                                testCode: test.testCode,
                                name: test.name,
                                category: test.category,
                                description: test.description || '',
                                sampleTypes: test.sampleTypes || [],
                                turnaroundTime: test.turnaroundTime || '',
                                price: Number(test.price),
                                preparationNotes: test.preparationNotes || '',
                                isHomeCollection: test.isHomeCollection,
                              });
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 text-[11px] px-2 ${
                              test.isActive
                                ? 'text-amber-700 hover:text-amber-900'
                                : 'text-emerald-700 hover:text-emerald-900'
                            }`}
                            onClick={() => {
                              updateMutation.mutate({
                                testId: test.id,
                                payload: { isActive: !test.isActive },
                              });
                            }}
                          >
                            {test.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Test Dialog */}
      <Dialog
        isOpen={isAddOpen || !!editingTest}
        onClose={() => {
          setIsAddOpen(false);
          setEditingTest(null);
        }}
        title={editingTest ? `Edit ${editingTest.testCode}` : 'Add Diagnostic Test'}
        description="Configure diagnostic investigation details and patient prep instructions."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            if (editingTest) {
              updateMutation.mutate({
                testId: editingTest.id,
                payload: testForm,
              });
            } else {
              createMutation.mutate(testForm);
            }
          }}
          className="space-y-4"
        >
          {errorMessage && <ErrorMessage message={errorMessage} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Test Code"
              placeholder="e.g. CBC-001, LFT-002"
              required
              disabled={!!editingTest}
              value={testForm.testCode}
              onChange={(e) => setTestForm({ ...testForm, testCode: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={testForm.category}
                onChange={(e) =>
                  setTestForm({ ...testForm, category: e.target.value as LabTestCategory })
                }
                className="w-full text-xs rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                {TEST_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Full Test Name"
                placeholder="e.g. Complete Blood Count (CBC) with Differential"
                required
                value={testForm.name}
                onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
              />
            </div>

            <Input
              label="Standard Turnaround Time"
              placeholder="e.g. 12 hours, 24 hours"
              value={testForm.turnaroundTime || ''}
              onChange={(e) => setTestForm({ ...testForm, turnaroundTime: e.target.value })}
            />

            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              min="0"
              required
              value={String(testForm.price)}
              onChange={(e) => setTestForm({ ...testForm, price: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <Input
            label="Patient Preparation Instructions"
            placeholder="e.g. 10-12 hour fasting required prior to blood draw; stay hydrated"
            value={testForm.preparationNotes || ''}
            onChange={(e) => setTestForm({ ...testForm, preparationNotes: e.target.value })}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isHomeCollection"
              checked={testForm.isHomeCollection || false}
              onChange={(e) =>
                setTestForm({ ...testForm, isHomeCollection: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            />
            <label htmlFor="isHomeCollection" className="text-xs font-medium text-slate-700 select-none">
              Eligible for Home Specimen Collection Visit
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingTest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingTest
                ? 'Update Test'
                : 'Add to Catalog'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
