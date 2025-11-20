'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level: 1 | 2 | 3;
}

export default function AdminCategoriesPage() {
  const [categories1, setCategories1] = useState<Category[]>([]);
  const [categories2, setCategories2] = useState<{ [key: string]: Category[] }>({});
  const [categories3, setCategories3] = useState<{ [key: string]: Category[] }>({});
  const [expandedCat1, setExpandedCat1] = useState<Set<string>>(new Set());
  const [expandedCat2, setExpandedCat2] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevel1Categories();
  }, []);

  const fetchLevel1Categories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories?level=1&parentId=null');
      const data = await response.json();
      setCategories1(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevel2Categories = async (parentId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/children/${parentId}`);
      const data = await response.json();
      setCategories2((prev) => ({ ...prev, [parentId]: data.categories || [] }));
    } catch (error) {
      console.error('Error fetching level 2 categories:', error);
    }
  };

  const fetchLevel3Categories = async (parentId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/children/${parentId}`);
      const data = await response.json();
      setCategories3((prev) => ({ ...prev, [parentId]: data.categories || [] }));
    } catch (error) {
      console.error('Error fetching level 3 categories:', error);
    }
  };

  const toggleCategory1 = (id: string) => {
    const newExpanded = new Set(expandedCat1);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      if (!categories2[id]) {
        fetchLevel2Categories(id);
      }
    }
    setExpandedCat1(newExpanded);
  };

  const toggleCategory2 = (id: string) => {
    const newExpanded = new Set(expandedCat2);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      if (!categories3[id]) {
        fetchLevel3Categories(id);
      }
    }
    setExpandedCat2(newExpanded);
  };

  const openAddModal = (level: 1 | 2 | 3, parentId: string = '') => {
    setModalMode('add');
    setSelectedLevel(level);
    setSelectedParent(parentId);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode('edit');
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add') {
      await createCategory();
    } else {
      await updateCategory();
    }
  };

  const createCategory = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          level: selectedLevel,
          parentId: selectedParent || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Category created successfully!');
        closeModal();
        
        // Refresh appropriate level
        if (selectedLevel === 1) {
          fetchLevel1Categories();
        } else if (selectedLevel === 2 && selectedParent) {
          fetchLevel2Categories(selectedParent);
        } else if (selectedLevel === 3 && selectedParent) {
          fetchLevel3Categories(selectedParent);
        }
      } else {
        toast.error(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('An error occurred');
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Category updated successfully!');
        closeModal();
        
        // Refresh appropriate level
        if (editingCategory.level === 1) {
          fetchLevel1Categories();
        } else if (editingCategory.level === 2 && editingCategory.parentId) {
          fetchLevel2Categories(editingCategory.parentId);
        } else if (editingCategory.level === 3 && editingCategory.parentId) {
          fetchLevel3Categories(editingCategory.parentId);
        }
      } else {
        toast.error(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Category deleted successfully!');
        
        // Refresh appropriate level
        if (category.level === 1) {
          fetchLevel1Categories();
        } else if (category.level === 2 && category.parentId) {
          fetchLevel2Categories(category.parentId);
        } else if (category.level === 3 && category.parentId) {
          fetchLevel3Categories(category.parentId);
        }
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="mt-2 text-gray-600">Organize your products with a 3-level hierarchy</p>
            </div>
            <button
              onClick={() => openAddModal(1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Level 1 Category
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {categories1.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No categories yet. Create your first category to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categories1.map((cat1) => (
                    <div key={cat1._id}>
                      {/* Level 1 Category */}
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <button
                              onClick={() => toggleCategory1(cat1._id)}
                              className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {expandedCat1.has(cat1._id) ? '▼' : '▶'}
                            </button>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{cat1.name}</h3>
                              {cat1.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{cat1.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openAddModal(2, cat1._id)}
                              className="px-3 py-1 text-sm bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600"
                            >
                              Add Subcategory
                            </button>
                            <button
                              onClick={() => openEditModal(cat1)}
                              className="px-3 py-1 text-sm bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(cat1)}
                              className="px-3 py-1 text-sm bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Level 2 Categories */}
                      {expandedCat1.has(cat1._id) && categories2[cat1._id] && (
                        <div className="ml-8 border-l-2 border-gray-200 dark:border-gray-700">
                          {categories2[cat1._id].map((cat2) => (
                            <div key={cat2._id}>
                              <div className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    <button
                                      onClick={() => toggleCategory2(cat2._id)}
                                      className="mr-2 text-gray-500 hover:text-gray-700"
                                    >
                                      {expandedCat2.has(cat2._id) ? '▼' : '▶'}
                                    </button>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800">{cat2.name}</h4>
                                      {cat2.description && (
                                        <p className="text-sm text-gray-600">{cat2.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openAddModal(3, cat2._id)}
                                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                      Add Sub-sub
                                    </button>
                                    <button
                                      onClick={() => openEditModal(cat2)}
                                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(cat2)}
                                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Level 3 Categories */}
                              {expandedCat2.has(cat2._id) && categories3[cat2._id] && (
                                <div className="ml-8 border-l-2 border-gray-200">
                                  {categories3[cat2._id].map((cat3) => (
                                    <div key={cat3._id} className="p-4 hover:bg-gray-50">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <h5 className="font-medium text-gray-700">{cat3.name}</h5>
                                          {cat3.description && (
                                            <p className="text-sm text-gray-600">{cat3.description}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => openEditModal(cat3)}
                                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDelete(cat3)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {categories3[cat2._id].length === 0 && (
                                    <p className="p-4 text-sm text-gray-500 italic">No sub-subcategories</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {categories2[cat1._id].length === 0 && (
                            <p className="p-4 text-sm text-gray-500 italic">No subcategories</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {modalMode === 'add' ? `Add Level ${selectedLevel} Category` : 'Edit Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'add' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
