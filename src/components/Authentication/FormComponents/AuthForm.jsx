export default function AuthForm({ children, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col justify-center items-center p-10 my-[0rem] md:my-[5rem] mx-0 md:mx-[10rem] rounded-md"
    >
      {children}
    </form>
  );
}
