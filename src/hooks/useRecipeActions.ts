import { useState } from 'react';
import { useShoppingLists } from './useShoppingLists';
import ShoppingListService from '@/services/ShoppingListService';
import { generateItemId } from '@/utils/id';

interface UseRecipeActionsReturn {
  isProcessing: boolean;
  addIngredientsToList: (listId: string, ingredients: string[]) => Promise<boolean>;
  createListWithIngredients: (name: string, description: string | undefined, ingredients: string[]) => Promise<string | null>;
}

export const useRecipeActions = (): UseRecipeActionsReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createList } = useShoppingLists();
  const service = ShoppingListService.getInstance();

  const addIngredientsToList = async (listId: string, ingredients: string[]): Promise<boolean> => {
    setIsProcessing(true);
    try {
      console.log('🍳 Adding ingredients to list:', { listId, ingredients });
      
      // Add ingredients sequentially to avoid race conditions
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        const itemId = generateItemId();
        
        console.log(`🍳 Adding ingredient ${i + 1}/${ingredients.length}:`, { ingredient, itemId });
        
        const success = await service.addItemToList({
          listId,
          itemName: ingredient,
          clientItemId: itemId,
          quantity: 1,
          unit: '',
          notes: ''
        });
        
        if (!success) {
          console.error(`🍳 Failed to add ingredient: ${ingredient}`);
          return false;
        }
      }
      
      console.log('🍳 All ingredients added successfully');
      return true;
    } catch (error) {
      console.error('🍳 Error adding ingredients to list:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const createListWithIngredients = async (
    name: string, 
    description: string | undefined, 
    ingredients: string[]
  ): Promise<string | null> => {
    setIsProcessing(true);
    try {
      // First create the list
      const newListId = await createList(name, description);
      if (!newListId) {
        return null;
      }

      // Then add ingredients
      const success = await addIngredientsToList(newListId, ingredients);
      if (!success) {
        console.warn('List created but failed to add ingredients');
      }

      return newListId;
    } catch (error) {
      console.error('Error creating list with ingredients:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    addIngredientsToList,
    createListWithIngredients
  };
};