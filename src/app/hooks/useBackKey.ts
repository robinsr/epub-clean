import { useInput } from 'ink';

const defaultOpts = {
  backKey: 'b',
  arrows: true
}

type backOptions = {
  backKey?: string;
  arrows?: boolean;
}

export type backFn = () => void;

const useBackKey = (onBack: backFn, options: backOptions = {}) => {
  let { backKey, arrows } = Object.assign(defaultOpts, options);

  useInput((input, keys) => {
    if (input === backKey) {
      onBack();
    }

    if (arrows && keys.leftArrow) {
      onBack();
    }
  });
}


export default useBackKey;
