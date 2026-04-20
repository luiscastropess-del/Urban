async function check() {
  const pk = process.env.GCP_PRIVATE_KEY || "";
  console.log("Includes newlines?", pk.includes('\n'));
  console.log("Includes literal \\n?", pk.includes('\\n'));
  
  if (pk.includes('\n')) {
     console.log("Wait, the env parser naturally parsed the newlines!");
  } else if (!pk.includes('\\n') && pk.includes(' ')) {
     console.log("The env parser flattened the newlines to spaces!");
  }
}
check().finally(() => process.exit(0));
