export default function AuthForm({ children, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center p-10 my-[0rem] md:my-[5rem] mx-0 md:mx-[30rem] rounded-md"
    >
      {children}
    </form>
  );
}
