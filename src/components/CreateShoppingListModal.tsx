import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BaseEditModal from '@/components/BaseEditModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CreateShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (name: string, description?: string) => Promise<void>;
}

const CreateShoppingListModal: React.FC<CreateShoppingListModalProps> = ({
  isOpen,
  onClose,
  onCreateList
}) => {
  const { t } = useTranslation();
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const handleSave = async () => {
    if (!newListName.trim()) return;

    await onCreateList(newListName.trim(), newListDescription.trim() || undefined);

    // Reset form
    setNewListName('');
    setNewListDescription('');
    onClose();
  };

  const handleClose = () => {
    setNewListName('');
    setNewListDescription('');
    onClose();
  };

  const createListTexts = {
    title: t('createNewList', 'Crear Nueva Lista'),
    description: '',
    cancel: t('cancel', 'Cancelar'),
    save: t('create', 'Crear'),
    saving: t('creating', 'Creando...')
  };

  return (
    <BaseEditModal
      isOpen={isOpen}
      onClose={handleClose}
      onSave={handleSave}
      texts={createListTexts}
      canSave={!!newListName.trim()}
    >
      <div>
        <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('listName', 'Nombre de la lista')}
        </label>
        <Input
          id="listName"
          placeholder={t('enterListName', 'Ingresa el nombre de la lista')}
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="listDescription" className="block text-sm font-medium text-gray-700 mb-1">
          {t('description', 'Descripción')} ({t('optional', 'opcional')})
        </label>
        <Textarea
          id="listDescription"
          placeholder={t('enterListDescription', 'Descripción de la lista')}
          value={newListDescription}
          onChange={(e) => setNewListDescription(e.target.value)}
          rows={3}
        />
      </div>
    </BaseEditModal>
  );
};

export default CreateShoppingListModal;