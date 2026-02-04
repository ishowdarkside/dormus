interface AvatarFromFirstNameProps {
  firstname: string | undefined;
}

export const AvatarFromFirstName = ({ firstname }: AvatarFromFirstNameProps) => {
  return (
    <div className="border border-cinco text-cinco text-xs px-1 minx-w-[18px] h-[18px] rounded-full items-center text-center">
      {firstname?.[0]}
    </div>
  );
};
