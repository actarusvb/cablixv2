#!/usr/bin/perl

use DBI;
use strict;
use Data::UUID;

my $driver   = "SQLite"; 
my $database = "db/cablix.db";
my $dsn = "DBI:$driver:dbname=$database";
my $userid = "";
my $password = "";
my $dbh = DBI->connect($dsn, $userid, $password, { RaiseError => 1 }) 
   or die $DBI::errstr;

print "Opened database successfully\n";
my $stmt = qq(SELECT max(id) from adder;);
my $sth = $dbh->prepare( $stmt );
my $rv = $sth->execute() or die $DBI::errstr;

if($rv < 0) {
   print $DBI::errstr;
}
my $max;
while(my @row = $sth->fetchrow_array()) {
	$max = $row[0];
      print "Max ID = ". $row[0] . "\n";
}
print "Operation done successfully\n";

my ($size, $number) = @ARGV;
 
if (not defined $size) {
  die "ciao! la prossima $0 <size> <number>\n";
}
 
if (not defined $number) {
	die "Need number\n";
}

print "Start create $number adder of $size racks each\n";

my $ug = Data::UUID->new;
my $istr=qq[insert into adder (id,uuid,size) values(?,?,?)];
$sth = $dbh->prepare($istr);
for (my $i=$max;$i<($number+$max);$i++){
	my $uuid1 = $ug->create();
	my $tuuid=$ug->to_string( $uuid1 );
	$sth->execute($i+1,$tuuid,$size);
	print "$i - $tuuid \n";
}
$dbh->disconnect();
