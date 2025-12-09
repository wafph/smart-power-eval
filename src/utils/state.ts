import { reactive } from 'vue';
const states = reactive<any>({
  lang: 'zh',
});

export function useState() {
  return {
    states,
    setCurrentLang: (val) => (states.lang = val),
  };
}
