import RecipeCard from "../components/RecipeCard";
import { gql, GraphQLClient } from "graphql-request";

export default function Recipes({ recipes }) {
  return (
    <div className="recipe-list">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
      <style jsx>{`
        .recipe-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 20px 60px;
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps = async () => {
  const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHCMS_URL);

  const query = gql`
    query Recipes {
      recipes {
        title
        slug
        thumbnail {
          url
        }
        featuredImage {
          url
        }
        method {
          html
          markdown
          raw
          text
        }
        cookingTime
        createdAt
        ing
        id
      }
    }
  `;

  const data = await client.request(query);

  return {
    props: { recipes: data.recipes },
  };
};
