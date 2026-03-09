import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '../../../../hooks/useTranslation';

const AddCategoryForm = ({ newCat, setNewCat, onAdd }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <input
        autoFocus
        type="text"
        className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-indigo-500 outline-none text-gray-900 dark:text-white text-sm"
        placeholder={t('transaction.category_name')}
        value={newCat}
        onChange={(e) => setNewCat(e.target.value)}
      />
      <button
        type="button"
        onClick={onAdd}
        className="p-3 bg-indigo-600 cursor-pointer text-white rounded-xl"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default AddCategoryForm;