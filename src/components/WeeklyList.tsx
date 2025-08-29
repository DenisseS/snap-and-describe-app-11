
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronRight } from 'lucide-react';
import CreateShoppingListModal from '@/components/CreateShoppingListModal';
import { useShoppingLists } from '@/hooks/useShoppingLists';

const WeeklyList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createList } = useShoppingLists();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateListClick = () => {
    console.log('🛒 CreateList: Opening create list modal');
    setShowCreateModal(true);
  };

  const handleCreateList = async (name: string, description?: string) => {
    console.log('🛒 WeeklyList: Creating new list:', name);

    const listId = await createList(name, description);
    if (listId) {
      console.log('🛒 WeeklyList: List created successfully, navigating to detail');
      navigate(`/shopping-lists/${listId}`);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div
          className="bg-gray-100 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleCreateListClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t('weeklyList')}</h3>
                <p className="text-xs text-gray-600">{t('weeklyListDescription')}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <CreateShoppingListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateList={handleCreateList}
      />
    </>
  );
};

export default WeeklyList;
