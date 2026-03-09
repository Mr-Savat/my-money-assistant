import { useState } from "react";

export const useCategoryManager = (categories, setCategories, formData, setFormData) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddCat = () => {
    if (newCat.trim() && !categories.includes(newCat)) {
      setCategories([...categories, newCat]);
      setFormData({ ...formData, category: newCat });
      setNewCat("");
      setIsAddingNew(false);
    }
  };

  const handleDeleteCat = (categoryToDelete) => {
    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    setCategories(updatedCategories);
    localStorage.setItem('user_categories_list', JSON.stringify(updatedCategories));

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