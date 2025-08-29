import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuthentication } from '@/hooks/useAuthentication.ts';
import { AuthState } from '@/types/auth';
import { DataState, UserProfile } from '@/types/userData';

interface HomeGreetingProps {
  userProfile: UserProfile | null;
  userState: DataState;
}

const HomeGreeting: React.FC<HomeGreetingProps> = ({ userProfile, userState }) => {
  const { t } = useTranslation();
  const { authState, login } = useAuthentication();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const handleConnectDropbox = async () => {
    try {
      await login();
    } catch (error) {
      console.error('🔐 HomeGreeting: Login error:', error);
    }
  };

  // Pattern matching con AuthState y DataState como fuentes de verdad
  const renderContent = () => {
    switch (authState) {
      case AuthState.LOADING:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        );

      case AuthState.AUTHENTICATED:
      { const displayName = userProfile?.name ??  null;
        const isProcessing = userState === DataState.PROCESSING;

        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {t('reinventEating')}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {t('appDescription')}
              </p>
              {isProcessing || !displayName && (
                <div className="text-xs text-blue-500 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                  {t('syncing')}
                </div>
              )}
            </div>
          </div>
        ); }

      case AuthState.LOGGING_IN:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {t('reinventEating')}
              </h1>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {t('appDescription')}
              </p>
              <Button
                onClick={handleConnectDropbox}
                variant="outline"
                size="default"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 px-4 py-2 text-sm"
                disabled={true}
              >
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {t('connecting')}
                </div>
              </Button>
            </div>
          </div>
        );

      case AuthState.IDLE:
      case AuthState.ERROR:
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {t('reinventEating')}
              </h1>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {t('appDescription')}
              </p>
              <Button
                onClick={handleConnectDropbox}
                variant="outline"
                size="default"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 px-4 py-2 text-sm"
              >
                {t('connectDropbox')}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 mb-4 min-h-[8rem] h-[17vh] md:h-[35vh] max-h-[12rem]">
      {renderContent()}
    </div>
  );
};

export default HomeGreeting;