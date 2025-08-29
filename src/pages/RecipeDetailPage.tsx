import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Users, ChefHat, Plus, ArrowLeft, ToggleLeft, ToggleRight, ShoppingCart } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AddToShoppingListModal from '@/components/AddToShoppingListModal';
import { Recipe, getAllRecipes, recipeCategories } from '@/data/recipes';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { useRecipeActions } from '@/hooks/useRecipeActions';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useToast } from '@/hooks/use-toast';

const RecipeDetailPage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthentication();
  const { lists } = useShoppingLists();
  const { addIngredientsToList, createListWithIngredients, isProcessing } = useRecipeActions();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(4);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (recipeId) {
      const allRecipes = getAllRecipes();
      const foundRecipe = allRecipes.find(r => r.id === recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
        setServings(foundRecipe.servings);
      }
    }
  }, [recipeId]);

  if (!recipe) {
    return (
      <Layout currentView="recipes">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">{t('recipeNotFound', 'Receta no encontrada')}</p>
        </div>
      </Layout>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const servingMultiplier = servings / recipe.servings;

  const adjustIngredientQuantity = (ingredient: string): string => {
    const numberRegex = /(\d+(?:\.\d+)?)/g;
    return ingredient.replace(numberRegex, (match) => {
      const num = parseFloat(match);
      const adjusted = num * servingMultiplier;
      return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
    });
  };

  const handleAddToShoppingList = () => {
    if (!isAuthenticated) {
      toast({
        title: t('authRequired', 'Autenticación requerida'),
        description: t('authRequiredToAddToList', 'Inicia sesión para añadir ingredientes a tus listas'),
        variant: 'destructive'
      });
      return;
    }
    setShowAddModal(true);
  };

  const handleSelectList = async (listId: string) => {
    const listName = lists[listId]?.name || 'Lista';
    const success = await addIngredientsToList(listId, recipe.ingredients);
    
    if (success) {
      toast({
        title: t('ingredientsAdded', 'Ingredientes añadidos'),
        description: t('ingredientsAddedToList', `Se añadieron ${recipe.ingredients.length} ingredientes a ${listName}`),
        action: (
          <Button
            size="sm"
            onClick={() => navigate(`/shopping-lists/${listId}`)}
            className="ml-2"
          >
            {t('goToList', 'Ir a la lista')}
          </Button>
        )
      });
    } else {
      toast({
        title: t('error', 'Error'),
        description: t('failedToAddIngredients', 'No se pudieron añadir los ingredientes'),
        variant: 'destructive'
      });
    }
  };

  const handleCreateList = async (name: string, description?: string) => {
    const newListId = await createListWithIngredients(name, description, recipe.ingredients);
    if (newListId) {
      toast({
        title: t('listCreated', 'Lista creada'),
        description: t('listCreatedAndIngredientsAdded', `Se creó "${name}" y se añadieron los ingredientes`),
        action: (
          <Button
            size="sm"
            onClick={() => navigate(`/shopping-lists/${newListId}`)}
            className="ml-2"
          >
            {t('goToList', 'Ir a la lista')}
          </Button>
        )
      });
      return newListId;
    } else {
      toast({
        title: t('error', 'Error'),
        description: t('failedToCreateList', 'No se pudo crear la lista'),
        variant: 'destructive'
      });
    }
    return null;
  };

  const headerProps = {
    title: recipe.name,
    showBackButton: true,
    showAvatar: true
  };

  return (
    <Layout currentView="recipes" headerProps={headerProps}>
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-4">
          {/* Recipe header with image (hidden in cooking mode) */}
          {!isCookingMode && (
            <div className="mb-6">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4"
              />
            </div>
          )}

          {/* Recipe info and controls */}
          <div className="space-y-6">
            {/* Title and basic info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.prepTime}m
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} {t('servings', 'porciones')}
                </div>
                <Badge className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {recipe.categories.map((categoryId) => {
                  const category = recipeCategories.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="outline" className="text-xs">
                      {category.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t('servings', 'Porciones')}:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setServings(Math.max(1, servings - 1))}
                          disabled={servings <= 1}
                        >
                          -
                        </Button>
                        <span className="min-w-[2rem] text-center font-medium">{servings}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setServings(servings + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Cooking mode toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t('cookingMode', 'Modo cocinando')}:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsCookingMode(!isCookingMode)}
                        className="p-1"
                      >
                        {isCookingMode ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddToShoppingList} 
                    className="gap-2"
                    disabled={isProcessing}
                  >
                    <Plus className="h-4 w-4" />
                    {isProcessing ? t('adding', 'Añadiendo...') : t('addToList', 'Añadir a lista')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {t('ingredients', 'Ingredientes')}
                </h3>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm">
                        {servings !== recipe.servings ? adjustIngredientQuantity(ingredient) : ingredient}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={handleAddToShoppingList}
                >
                  {t('addAllToList', 'Añadir todos a lista')}
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  {t('instructions', 'Instrucciones')}
                </h3>
                
                {isCookingMode ? (
                  /* Cooking mode - simplified step by step */
                  <div className="space-y-6">
                    {recipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-base leading-relaxed">{instruction}</p>
                          {index < recipe.instructions.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Normal mode - list format */
                  <div className="space-y-3">
                    {recipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutrition info */}
            {!isCookingMode && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t('nutritionInfo', 'Información Nutricional')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {Math.round(recipe.nutrition.calories * servingMultiplier)}
                      </div>
                      <div className="text-xs text-gray-600">{t('calories', 'Calorías')}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(recipe.nutrition.protein * servingMultiplier)}g
                      </div>
                      <div className="text-xs text-gray-600">{t('protein', 'Proteína')}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(recipe.nutrition.carbs * servingMultiplier)}g
                      </div>
                      <div className="text-xs text-gray-600">{t('carbs', 'Carbohidratos')}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round(recipe.nutrition.fat * servingMultiplier)}g
                      </div>
                      <div className="text-xs text-gray-600">{t('fat', 'Grasas')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddToShoppingListModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
        lists={lists}
        itemsToAdd={recipe.ingredients}
      />
    </Layout>
  );
};

export default RecipeDetailPage;