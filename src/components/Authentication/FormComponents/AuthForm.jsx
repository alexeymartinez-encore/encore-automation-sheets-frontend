export default function AuthForm({ children, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col justify-center items-center px-5 md:p-10 my-[0rem] md:my-[5rem] mx-0 md:mx-[10rem] rounded-md text-sm"
    >
      {children}
    </form>
  );
}
