import { computed, ref, onMounted } from 'vue';
import { store } from '../../stores';

const isAdmin = computed(() => store.isAdmin);

const currentTime = ref(new Date().toLocaleString());
onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);
});

const rankings = [
  { name: 'Team Alpha', score: 540 },
  { name: 'Sarah Chen', score: 320 },
  { name: 'EcoWarriors', score: 280 },
];

export {
    isAdmin,
    currentTime,
    rankings,
    store
}
