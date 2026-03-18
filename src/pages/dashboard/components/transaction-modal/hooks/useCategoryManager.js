import { useState } from "react";
import { auth } from "../../../../../firebase/config";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useCategoryManager = (categories, setCategories, formData, setFormData) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ++++++ ទាញយក Token ++++++
  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    return await user.getIdToken();
  };

  // ++++++ កែ handleAddCat ឲ្យប្រើ API ++++++
  const handleAddCat = async () => {
    if (!newCat.trim() || categories.includes(newCat)) return;

    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCat })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCategories([...categories, newCat]);
        setFormData({ ...formData, category: newCat });
        setNewCat("");
        setIsAddingNew(false);
      } else {
        alert('Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Connection error');
    }
  };

  // ++++++ កែ handleDeleteCat ឲ្យប្រើ API ++++++
  const handleDeleteCat = async (categoryToDelete) => {
    // ត្រូវការ ID របស់ Category (យើងត្រូវកែរចនាសម្ព័ន្ធឲ្យផ្ទុក ID)
    // បច្ចុប្បន្ន categories ជា array នៃឈ្មោះ ដូច្នេះត្រូវកែបន្តិច
    
    // សម្រាប់ពេលនេះ យើងរក្សាទុកដដែល ហើយក្រោយមកកែប្តូរ
    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    setCategories(updatedCategories);
    
    // TODO: ពេលមាន API សម្រាប់ Categories រួច ត្រូវហៅ DELETE ផង

    if (formData.category === categoryToDelete) {
      const newCategory = updatedCategories.length > 0 ? updatedCategories[0] : '';
      setFormData({ ...formData, category: newCategory });
    }
  };

  return {
    isAddingNew,
    setIsAddingNew,
    newCat,
    setNewCat,
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    handleAddCat,
    handleDeleteCat
  };
};