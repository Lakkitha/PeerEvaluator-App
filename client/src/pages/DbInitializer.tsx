import DbInitializerComponent from "../components/DbInitializer";

const DbInitializer = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Database Initialization
      </h1>

      <div className="max-w-md mx-auto">
        <DbInitializerComponent />
      </div>
    </div>
  );
};

export default DbInitializer;
