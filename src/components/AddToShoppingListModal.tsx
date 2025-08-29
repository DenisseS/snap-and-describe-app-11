import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import CreateShoppingListModal from './CreateShoppingListModal';
import { ShoppingList } from '@/types/shoppingList';

interface AddToShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectList: (listId: string) => Promise<void>;
  onCreateList: (name: string, description?: string) => Promise<string | null>;
  lists: Record<string, ShoppingList>;
  itemsToAdd: string[];
}

const AddToShoppingListModal: React.FC<AddToShoppingListModalProps> = ({
  isOpen,
  onClose,
  onSelectList,
  onCreateList,
  lists,
  itemsToAdd
}) => {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectList = async (listId: string) => {
    setIsProcessing(true);
    try {
      await onSelectList(listId);
      onClose();
    } catch (error) {
      console.error('Error adding to list:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewList = async (name: string, description?: string) => {
    const newListId = await onCreateList(name, description);
    if (newListId) {
      setShowCreateModal(false);
      await handleSelectList(newListId);
    }
  };

  const sortedLists = Object.values(lists).sort((a, b) => {
    if (typeof a.order === 'number' && typeof b.order === 'number') {
      return a.order - b.order;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <>
      <Dialog open={isOpen && !showCreateModal} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('addToShoppingList', 'Añadir a Lista de Compras')}
            </DialogTitle>
            <DialogDescription>
              {t('selectListToAdd', 'Selecciona una lista o crea una nueva para añadir')} {itemsToAdd.length} {t('ingredients', 'ingredientes')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create new list button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="w-full justify-start gap-2 h-auto p-3"
              disabled={isProcessing}
            >
              <Plus className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{t('createNewList', 'Crear Nueva Lista')}</div>
                <div className="text-xs text-muted-foreground">{t('createNewListDescription', 'Crear una lista nueva para estos ingredientes')}</div>
              </div>
            </Button>

            {/* Existing lists */}
            {sortedLists.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {t('existingLists', 'Listas Existentes')}
                </h4>
                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {sortedLists.map((list) => (
                      <Card
                        key={list.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSelectList(list.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{list.name}</h5>
                              {list.description && (
                                <p className="text-xs text-gray-600 mt-1">{list.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <span>{list.itemCount || 0} {t('items', 'elementos')}</span>
                                {list.completedCount !== undefined && (
                                  <span>• {list.completedCount} {t('completed', 'completados')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {sortedLists.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('noListsYet', 'No tienes listas de compras aún')}</p>
                <p className="text-xs">{t('createFirstList', 'Crea tu primera lista para empezar')}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateShoppingListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateList={handleCreateNewList}
      />
    </>
  );
};

export default AddToShoppingListModal;
