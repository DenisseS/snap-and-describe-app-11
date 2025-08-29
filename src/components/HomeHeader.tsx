import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface HomeHeaderProps {
  onLanguageToggle: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ onLanguageToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center p-2 xs:p-3 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-sm xs:text-base font-bold text-gray-800">
          NutriScan Beta
        </h1>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onLanguageToggle}
        className="bg-white/80 backdrop-blur-sm flex-shrink-0 h-8 w-8"
      >
        <Globe className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default HomeHeader;