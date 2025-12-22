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
  actions: [],
  isTestTask: false,
});

export function useState() {
  return {
    states,
    setCurrentId: (val: number) => (states.id = val),
    setCurrentActions: (val: any) => (states.actions = val),
    setCurrentTestTask: (val: any) => (states.isTestTask = val),
  };
}
