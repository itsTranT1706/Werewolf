function createLogger(context = 'app') {
  const serialize = (meta) => {
    if (!meta) return '';
    try {
      return JSON.stringify(meta);
    } catch (_err) {
      return String(meta);
    }
  };

  const log = (level, message, meta) => {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${context}] [${level}] ${message}`;
    if (level === 'ERROR') {
      console.error(line, meta ? serialize(meta) : '');
    } else if (level === 'WARN') {
      console.warn(line, meta ? serialize(meta) : '');
    } else {
      console.log(line, meta ? serialize(meta) : '');
    }
  };

  return {
    info: (message, meta) => log('INFO', message, meta),
    warn: (message, meta) => log('WARN', message, meta),
    error: (message, meta) => log('ERROR', message, meta)
  };
}

module.exports = createLogger;
