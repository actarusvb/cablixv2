#/usr/lib/perl
use strict;
use warnings;

use Data::Dumper;

use lib qw(..);

use JSON;

my $filename = 'RackElements/elementType.json';

my $json_text = do {
   open(my $json_fh, "<:encoding(UTF-8)", $filename)
      or die("Can't open \$filename\": $!\n");
   local $/ =undef;
   <$json_fh>
};

my $json = JSON->new;

# try {
	eval {decode_json($json_text);};
# } catch (my $e){
	print ("invalid Json error $@") if $@;
# }

my $data = decode_json($json_text);

# print  Dumper( $data);

for ( @{$data->{data}} ) {
   print $_->{name}."\n";
}
