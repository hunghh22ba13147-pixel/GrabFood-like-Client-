// Callback tests only: hooks/native primitives/navigation are mocks, not DOM/E2E.
const Module = require('node:module');
const React = require('react');
const cartModule = require('../cartStore.ts'), orderModule = require('../orderStore.ts');
function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  return node && typeof node === 'object' ? text(node.props?.children) : '';
}
function walk(node, predicate, found = []) {
  if (Array.isArray(node)) { node.forEach(n => walk(n, predicate, found)); return found; }
  if (!node || typeof node !== 'object') return found;
  if (predicate(node)) found.push(node);
  walk(node.props?.children, predicate, found); return found;
}
function render(relativePath, fixture, { values = [], props = {}, confirm = false } = {}) {
  const native = { Platform: { OS: 'web' }, StyleSheet: { create: s => s, hairlineWidth: 1 }, Alert: { alert: (...args) => nativeAlerts.push(args) } };
  for (const name of ['View', 'Text', 'FlatList', 'TouchableOpacity', 'Image', 'Pressable', 'ScrollView', 'TextInput', 'SafeAreaView', 'KeyboardAvoidingView', 'ActivityIndicator']) native[name] = name;
  const events = [], notices = [], nativeAlerts = [], dialogs = [], updates = [];
  const nav = { navigate: (...args) => events.push(['navigate', ...args]), reset: (...args) => events.push(['reset', ...args]), goBack: () => events.push(['goBack']) };
  let cursor = 0;
  const hookReact = { ...React, useEffect() {}, useRef: value => ({ current: value }), useState: initial => {
    const index = cursor++; return [index < values.length ? values[index] : typeof initial === 'function' ? initial() : initial, value => updates.push([index, value])];
  } };
  const hook = store => Object.assign(selector => selector ? selector(store.getState()) : store.getState(), store);
  const load = Module._load, previousAlert = globalThis.alert, previousConfirm = globalThis.confirm;
  globalThis.alert = message => notices.push(message); globalThis.confirm = message => { dialogs.push(message); return confirm; };
  Module._load = function(request, parent, isMain) {
    if (request === 'react') return hookReact;
    if (request === 'react-native') return native;
    if (request === '@react-navigation/native') return { useNavigation: () => nav };
    if (request === '@expo/vector-icons') return { Ionicons: 'Ionicons' };
    if (request === '../../components/AddressPicker') return { __esModule: true, default: 'AddressPicker' };
    if (request === '../../services/firebase') return { isFirebaseConfigured: fixture.configured };
    if (request === '../../store/authStore') return { useAuthStore: hook(fixture.auth) };
    if (request === '../../store/cartStore') return { ...cartModule, useCartStore: hook(cartModule.useCartStore) };
    if (request === '../../store/orderStore') return { ...orderModule, useOrderStore: hook(orderModule.useOrderStore) };
    return load.call(this, request, parent, isMain);
  };
  let tree;
  try {
    const file = require.resolve(relativePath); delete require.cache[file]; tree = require(file).default(props);
  } finally { Module._load = load; }
  return { tree, events, notices, nativeAlerts, dialogs, updates,
    restore: () => { globalThis.alert = previousAlert; globalThis.confirm = previousConfirm; } };
}
module.exports = { render, text, walk };
