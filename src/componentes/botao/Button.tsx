import { Button as NativeBaseButton, IButtonProps, Heading } from 'native-base';

type Props = IButtonProps & {
  title: string;
};

export function Button({ title, ...rest }: Props) {
  return (
    <NativeBaseButton
      bg={'#7fdec7'}
      h={14}
      fontSize='sm'
      rounded={'sm'}
      _pressed={{ bg: '#9dedda' }}

      {...rest}
    >
      <Heading color={'black'} fontSize='sm'>
        {title}
      </Heading>
    </NativeBaseButton>
  );
}