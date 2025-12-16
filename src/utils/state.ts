import { reactive } from 'vue';
type T_CONFIG = {
  [key: string]: any;
};

type T_STATE = {
  [key: string]: any;
  config?: T_CONFIG;
};
const states = reactive<T_STATE>({
  id: 1,
});

export function useState() {
  return {
    states,
    setCurrentId: (val: number) => (states.id = val),
  };
}
