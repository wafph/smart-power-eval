import { reactive } from 'vue';

type T_CONFIG = {
  [key: string]: any;
};

type T_STATE = {
  [key: string]: any;
  config: T_CONFIG;
};

const states = reactive<T_STATE>({
  isSupport: false,
  config: {
    title_name: '',
    actions: '',
    process_type: '',
    enable_alternatives: false,
    success_url: '',
    failure_url: '',
    verification_code: '',
    order_id: '',
  },
  allDatasets: {
    qa: [],
    choice: [],
  },
  allModels: {
    qa2: [],
    choice2: [],
  },
});

export function useState() {
  return {
    states,
    setIsSupport: (val: boolean) => {
      states.isSupport = val;
    },
    setConfig: (val: T_CONFIG) => {
      states.config = val;
    },
    setAllDataSets: (val: any) => {
      states.allDatasets = val;
    },
    setAllModels: (val: any) => {
      states.allModels = val;
    },
  };
}
