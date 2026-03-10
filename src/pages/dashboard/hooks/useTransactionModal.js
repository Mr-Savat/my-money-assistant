// import { useState } from "react";
// import { useTranslation } from "../../../hooks/useTranslation";
//  export const useTransactionModal = () => {

//     const { t } = useTranslation();
//     const [isAddingNew, setIsAddingNew] = useState(false);
//     const [newCat, setNewCat] = useState("");
//     const [isOpen, setIsOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");

//     const handleAddCat = () => {
//         if (newCat.trim() && !categories.includes(newCat)) {
//             setCategories([...categories, newCat]);
//             setFormData({ ...formData, category: newCat });
//             setNewCat("");
//             setIsAddingNew(false);
//         }
//     };
//     const handleDeleteCat = (categoryToDelete) => {
//         // 1. Create the new list by filtering out the one you clicked
//         const updatedCategories = categories.filter(cat => cat !== categoryToDelete);

//         // 2. Update the React state so the UI refreshes immediately
//         setCategories(updatedCategories);

//         // 3. Update localStorage so they don't come back on refresh
//         localStorage.setItem('user_categories_list', JSON.stringify(updatedCategories));

//         //  4. ពិនិត្យមើលថាតើ category ដែលកំពុងជ្រើសរើសត្រូវបានលុបឬអត់? 
//         if (formData.category === categoryToDelete) {
//             // បើមាន category នៅសល់ យកទីមួយ បើអត់ទេ យកទទេ
//             const newCategory = updatedCategories.length > 0 ? updatedCategories[0] : '';
//             setFormData({ ...formData, category: newCategory });
//         }
//     };

//     return {
//         t, isAddingNew, setIsAddingNew, isOpen, setIsOpen, searchTerm, setSearchTerm, handleAddCat, handleDeleteCat,
//     }

    
// }