'use client';
import { useDocumentInfo } from '@payloadcms/ui';
import { useEffect, useState } from 'react';

interface IngredientDisplay {
  amount: string;
  ingredient: { name: string };
  is_main: boolean;
}

const IngredientsDisplay: React.FC = () => {
  const { id } = useDocumentInfo();
  const [ingredients, setIngredients] = useState<IngredientDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchIngredients = async () => {
      try {
        const response = await fetch(`/api/recipe-ingredients?where[recipe][equals]=${id}&depth=2`);
        const data = await response.json();
        setIngredients(data.docs);
      } catch (error) {
        console.error('Failed to fetch ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [id]);

  if (loading) return <div>Loading ingredients...</div>;
  if (!ingredients.length) return <div>No ingredients added yet</div>;

  return (
    <div style={{ padding: '8px 0' }}>
      {ingredients.map((ri, index) => (
        <div
          key={index}
          style={{
            marginBottom: '4px',
          }}
        >
          {ri.ingredient?.name || 'Unknown'} - {ri.amount}
          {ri.is_main && ' ⭐'}
        </div>
      ))}
    </div>
  );
};

export default IngredientsDisplay;
