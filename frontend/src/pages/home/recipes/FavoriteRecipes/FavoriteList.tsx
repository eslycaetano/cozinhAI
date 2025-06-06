import React, { useEffect, useState } from "react";
import { getAllFavorites } from "../../../../services/favoriteService";
import RecipeCard from "../../../../components/home/recipes/RecipeCard";
import Loading from "../../../../components/loading/Loading";
import RecipeFilterNavbar from "../../../../components/home/recipes/RecipeFilterNavbar";
import RecipeSortNavbar from "../../../../components/home/recipes/RecipeSortNavbar";

interface Filters {
  search?: string;
  difficulty?: number;
  maxPrepTime?: number;
  ingredient?: string;
  isGeneratedByAI?: boolean;
}

const FavoriteList: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<{
    field: "createdAt" | "likes" | "difficulty" | "prepTime";
    order: "asc" | "desc";
  }>({ field: "createdAt", order: "desc" });

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getAllFavorites();
        setFavorites(data);
      } catch (error) {
        console.error("Erro ao buscar receitas favoritas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Filtro igual ao RecipeList, mas usando favorite.recipe
  const filteredFavorites = favorites.filter((favorite) => {
    const recipe = favorite.recipe;
    if (
      filters.search &&
      !recipe.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !recipe.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.difficulty &&
      recipe.difficulty !== Number(filters.difficulty)
    ) {
      return false;
    }
    if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
      return false;
    }
    if (
      filters.ingredient &&
      !recipe.ingredients.some((ing: any) =>
        filters.ingredient &&
        ing.ingredientName?.toLowerCase().includes(filters.ingredient.toLowerCase())
      )
    ) {
      return false;
    }
    if (
      filters.isGeneratedByAI !== undefined &&
      filters.isGeneratedByAI !== null &&
      recipe.isGeneratedByAI !== filters.isGeneratedByAI
    ) {
      return false;
    }
    return true;
  });

  // Ordenação das receitas favoritas filtradas
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    const recipeA = a.recipe;
    const recipeB = b.recipe;
    let aValue = recipeA[sort.field];
    let bValue = recipeB[sort.field];

    if (
      sort.field === "difficulty" ||
      sort.field === "likes" ||
      sort.field === "prepTime"
    ) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (sort.field === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
    if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
    return 0;
  });

  if (isLoading) {
    return <Loading message="Carregando favoritos..." />;
  }

  return (
    <div>
      <RecipeFilterNavbar onFilter={setFilters} />
      <RecipeSortNavbar onSort={setSort} sort={sort} />
      {sortedFavorites.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhuma receita favorita encontrada.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFavorites.map((favorite) => (
            <RecipeCard
              key={favorite.recipe.id}
              id={favorite.recipe.id}
              title={favorite.recipe.title}
              description={favorite.recipe.description}
              image={favorite.recipe.image}
              prepTime={favorite.recipe.prepTime}
              servings={favorite.recipe.servings}
              difficulty={favorite.recipe.difficulty}
              isGeneratedByAI={favorite.recipe.isGeneratedByAI}
              createdAt={favorite.recipe.createdAt}
              likes={favorite.recipe.likes}
              user={favorite.recipe.user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteList;