import threading
import time

class SnowflakeGenerator:
  def __init__(self, worker_id: int = 1):
    self.epoch = 1776038400000
    
    self.worker_id_bits = 10
    self.sequence_bits = 12

    self.max_worker_id = (1 << self.worker_id_bits) - 1
    self.sequence_mask = (1 << self.sequence_bits) - 1

    if worker_id > self.max_worker_id or worker_id < 0:
      raise ValueError(f"worker_id must be between 0 and {self.max_worker_id}")
    
    self.worker_id = worker_id

    self.last_timestamp = -1
    self.sequence = 0

    self.lock = threading.Lock()

  def _get_current_timestamp(self) -> int:
    return int(time.time() * 1000)
  
  def _wait_for_next_millis(self, last_timestamp: int) -> int:
    timestamp = self._get_current_timestamp()
    while timestamp <= last_timestamp:
      timestamp = self._get_current_timestamp()
    return timestamp
  
  def generate(self) -> int:
    with self.lock:
      current_timestamp = self._get_current_timestamp()

      if current_timestamp < self.last_timestamp:
        raise Exception("Clock moved backwards. Refusing to generate id.")
      
      if current_timestamp == self.last_timestamp:
        self.sequence = (self.sequence + 1) & self.sequence_mask
        if self.sequence == 0:
          current_timestamp = self._wait_for_next_millis(self.last_timestamp)
      else:
        self.sequence = 0
      
      self.last_timestamp = current_timestamp

      timestamp_shifted = (current_timestamp - self.epoch) << (self.worker_id_bits + self.sequence_bits)
      worker_shifted = self.worker_id << self.sequence_bits

      return timestamp_shifted | worker_shifted | self.sequence
    

if __name__ == "__main__":
  generator = SnowflakeGenerator(worker_id=1)

  print("Generating 5 test IDs...")
  for _ in range(5):
    snowflake = generator.generate()
    print(f"ID: {snowflake} | Binary: {bin(snowflake)}")