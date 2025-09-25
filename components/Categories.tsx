// FIX: Implemented missing component to resolve import errors.
import React, { useState } from 'react';
import Icon from './Icon';
// FIX: Import the Category type.
import { Category } from '../types';

interface CategoriesProps {
    // FIX: Update props to use the Category object array and correct function signatures.
    categories: Category[];
    addCategory: (categoryName: string) => void;
    deleteCategory: (id: string) => void;
    updateCategory: (category: Category) => void;
}

const Categories: React.FC<CategoriesProps> = ({ categories, addCategory, deleteCategory, updateCategory }) => {
    const [newCategory, setNewCategory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCategory = newCategory.trim();
        if(trimmedCategory) {
            addCategory(trimmedCategory);
            setNewCategory('');
        }
    };

    // FIX: Separate categories into default and custom lists based on the isDefault flag.
    const defaultCategories = categories.filter(c => c.isDefault);
    const customCategories = categories.filter(c => !c.isDefault);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Catégories par défaut</h3>
                <div className="flex flex-wrap gap-2">
                    {defaultCategories.map(category => (
                        <span key={category.id} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium px-3 py-1 rounded-full">
                            {category.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Vos catégories personnalisées</h3>
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nouvelle catégorie"
                        className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button type="submit" className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300">
                        Ajouter
                    </button>
                </form>
                <div className="space-y-2">
                    {customCategories.length > 0 ? (
                        customCategories.map(category => (
                            <div key={category.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
                                <span className="text-slate-700 dark:text-slate-200">{category.name}</span>
                                {/* FIX: Call deleteCategory with the category's ID. */}
                                <button onClick={() => deleteCategory(category.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                                    <Icon name="fa-trash-can" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">Aucune catégorie personnalisée.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Categories;