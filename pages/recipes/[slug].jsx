import { GraphQLClient, gql } from "graphql-request";
import Skeleton from "../../components/Skeleton";
import Image from "next/image";
import { useRouter } from "next/router";

const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHCMS_URL);

export default function RecipeDetails({ recipe }) {
  if (!recipe) return <Skeleton />;

  const { title, featuredImage, ing, method, cookingTime } = recipe;

  function GraphCMSLoader({ src, width }) {
    const relativeSrc = (src) => src.split("/").pop();
    return `https://media.graphcms.com/resize=width:${width}/${relativeSrc(
      src
    )}`;
  }

  return (
    <div>
      <div className="banner">
        <Image
          src={featuredImage.url}
          loader={GraphCMSLoader}
          alt={title}
          width="1200"
          height="400"
          objectFit="cover"
        />
        <h2>{title}</h2>
      </div>
      <div className="info">
        <p>Takes about {cookingTime} mins to cook</p>
        <h3>Ingredients</h3>
        {ing.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="method">
        <h3>Method</h3>
        <div
          className="para"
          dangerouslySetInnerHTML={{ __html: method.html }}
        />
      </div>

      <style jsx>{`
        h2,
        h3 {
          text-transform: uppercase;
        }
        .para p {
          color: white;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
      `}</style>
    </div>
  );
}

export const getStaticProps = async ({ params }) => {
  const slug = params.slug;
  const query = gql`
    query Recipe($slug: String!) {
      recipe(where: { slug: $slug }) {
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

  const data = await client.request(query, { slug });

  if (!data.recipe) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { recipe: data.recipe },
    revalidate: 1,
  };
};

export const getStaticPaths = async () => {
  const query = gql`
    query Recipes {
      recipes {
        slug
      }
    }
  `;

  const data = await client.request(query);
  const paths = data.recipes.map((recipe) => {
    return {
      params: { slug: recipe.slug },
    };
  });

  return {
    paths,
    fallback: true,
  };
};
